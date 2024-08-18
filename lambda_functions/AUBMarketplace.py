# This AWS Lambda function processes an image from either an S3 bucket or a base64-encoded string, 
# uses Amazon Rekognition to detect labels in the image, 
# and returns the detected labels. 
# It includes error handling for AWS client errors and value errors, 
# logging relevant error messages for debugging.

import boto3
import logging
from botocore.exceptions import ClientError
import json
import base64

# Instantiate logger
logger = logging.getLogger(__name__)

# connect to the Rekognition client
rekognition = boto3.client('rekognition', region_name='us-east-1')

def lambda_handler(event, context):
    print("Event:")
    print(event)

    try:
        image = None

        if 'Records' in event:
            print("Records in event.")
            s3_record = event['Records'][0]['s3']
            bucket_name = 'rekkogni'
            object_key = s3_record['object']['key']
            s3 = boto3.resource('s3')
            s3_object = s3.Object(bucket_name, object_key)
            image = s3_object.get()['Body'].read()
            print(f"Found records in event. Bucket={bucket_name}, object key = {object_key}")


        elif 'image' in event:
            print("image in event.")
            image_bytes = event['image'].encode('utf-8')
            img_b64decoded = base64.b64decode(image_bytes)
            image = img_b64decoded


        elif image is None:
            raise ValueError('Missing image, check image or bucket path.')

        else:
            raise ValueError("Only base 64 encoded image bytes or S3Object are supported.")
        
        print("Now about to send request to Rekognition.")

        response = rekognition.detect_labels(Image={'Bytes': image})
        
        print("Finished sending request to Rekognition.")
        print("Response from Rekognition:")
        print(response)
        
        lambda_response = {
            "statusCode": 200,
            "body": json.dumps(response)
        }
        labels = [label['Name'] for label in response['Labels']]
        print("Labels found:")
        print(labels)

    except ClientError as client_err:

       error_message = "Couldn't analyze image: " + client_err.response['Error']['Message']

       lambda_response = {
           'statusCode': 400,
           'body': {
               "Error": client_err.response['Error']['Code'],
               "ErrorMessage": error_message
           }
       }
       logger.error("Error ClientError function %s: %s", context.invoked_function_arn, error_message)
       print("Error ClientError function %s: %s", context.invoked_function_arn, error_message)


    except ValueError as val_error:

        lambda_response = {
            'statusCode': 400,
            'body': {
                "Error": "ValueError",
                "ErrorMessage": format(val_error)
            }
        }
        logger.error("Error ValueError function %s: %s", context.invoked_function_arn, format(val_error))
        
        print("Error ValueError function %s: %s", context.invoked_function_arn, format(val_error))

    return lambda_response

