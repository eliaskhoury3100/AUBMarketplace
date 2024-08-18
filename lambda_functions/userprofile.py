# This AWS Lambda function updates user attributes in a Cognito User Pool, 
# including handling and storing a profile image in S3 if provided as base64-encoded data, 
# and then associating the image URL with the user's profile.

import json
import boto3
import base64
import re

# Initialize AWS clients
s3 = boto3.client('s3')
cognito_idp = boto3.client('cognito-idp')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_pool_id = 'eu-north-1_yY06qHPlb'
        userId = body.get('userId')
        
        attributes = []

        def add_attribute(name, value):
            if value is not None and isinstance(value, str):
                attributes.append({'Name': name, 'Value': value})

        add_attribute('custom:Nickname', body.get('nickname'))
        add_attribute('custom:AboutYou', body.get('aboutText'))
        add_attribute('custom:Major', body.get('major'))

        image_data = body.get('profileImage')
        if image_data:
            if image_data.startswith('http'):
                add_attribute('custom:ProfilePicture', image_data)
            else:
                # Directly decode the base64 image data
                try:
                    # Assume image_data is properly formatted base64 without any prefix
                    image_content = base64.b64decode(image_data)
                    file_name = f"{userId}.png"
                    bucket_name = 'user--profilepictures'

                    # Upload the decoded image to S3
                    s3.put_object(
                        Bucket=bucket_name,
                        Key=file_name,
                        Body=image_content,
                        ContentType='image/png'
                    )

                    # Construct the image URL
                    image_url = f'https://{bucket_name}.s3.amazonaws.com/{file_name}'
                    add_attribute('custom:ProfilePicture', image_url)
                except Exception as e:
                    print(f"Failed to decode and upload image data: {str(e)}")

        if attributes:
            cognito_idp.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=userId,
                UserAttributes=attributes
            )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User profile updated successfully!'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
            }
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
            }
        }
