# This AWS Lambda function processes a found ID's details, extracts initials from the name, 
# and sends a notification via SNS using those initials as a filter. It handles and logs errors if they occur.

import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize SNS and log the received event for debugging purposes
    sns_client = boto3.client('sns', region_name='eu-north-1')
    print(f"Received event: {json.dumps(event)}")
 
    body = json.loads(event['body'])
    name = body.get('name', '')
    initials = body.get('initials', '')
    phone = body.get('phone', '')
    finder= body.get('finderName','')
    comments = body.get('comments', '')
    print(f"Name: {name}")

    print(name)
    
    # Process the name to extract the first letter of the first three words in lowercase
    processed_name = ''
    if name:
        words = name.split()  # Split the name into words
        # Take the first letter of the first three words and convert to lowercase
        processed_name = ''.join([word[0] for word in words[:3]]).lower()
    
    # Log the processed name initials for debugging
    print(f"Processed Name Initials: {processed_name}")
    
    # Prepare the message attributes based on the processed initials
    message_attributes = {
        'initials': {
            'DataType': 'String',
            'StringValue': processed_name  # Use the processed initials
        }
    }
    
    # Construct the message to be sent via SNS
    message = (
    f"A lost ID has been found with the initials '{processed_name.lower()}'.\n"
    "Details:"
    )
    message += f"\nName: {name}" if name else ""
    message += f"\nFound by: {finder}" if finder else ""
    message += f"\nPhone: {phone}" if phone else ""
    message += f"\nComments: {comments}" if comments else ""
    try:
        # Publish the message to the SNS topic with the initials filter
        sns_client.publish(
            TopicArn='arn:aws:sns:eu-north-1:851725189420:LostIDs',  # Replace with your actual SNS topic ARN
            Message=message,
            Subject='Lost ID Notification',
            MessageAttributes=message_attributes
        )
        
        print("Message successfully published to SNS")

        # Return a success message
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data processed and notification sent successfully',
                'processed_name_initials': processed_name
            })
        }

    except ClientError as e:
        # Handle errors with SNS publish
        print(f"Failed to publish message to SNS: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to send notification'})
        }

    except Exception as e:
        # Handle any other errors
        print(f"Unexpected error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An internal server error occurred'})
        }
