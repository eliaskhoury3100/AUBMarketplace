# This AWS Lambda function initiates a password reset process for a user in a 
# Cognito User Pool based on their email address. It first checks if the email 
# exists in the user pool, and if so, it triggers the forgot password flow. 
# The function handles errors appropriately, returning relevant messages 
# for missing fields, non-existent users, and other exceptions.

import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize the Cognito client
    client = boto3.client('cognito-idp', region_name='eu-north-1')
    client_id = '4fii2i04p9mtnm9q9vajbaigkb'
    
    # Log the incoming event for debugging
    print(f"Received event: {json.dumps(event)}")

    try:
        # Parse the JSON body from the request
        body = json.loads(event['body'])
        email = body.get('email')
        
        # Check if email is provided
        if not email:
            print("Error: Email field is required.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email field is required.'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Check if the email corresponds to an existing user
        try:
            client.admin_get_user(
                UserPoolId='eu-north-1_yY06qHPlb',  # Replace with your User Pool ID
                Username=email
            )
        except client.exceptions.UserNotFoundException:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No user found with this email address.'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }
        
        # Attempt to initiate the forgot password flow
        response = client.forgot_password(
            ClientId=client_id,
            Username=email,
        )

        # Return a success message
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Password reset initiated. Please check your email.'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }

    except ClientError as e:
        # Log the ClientError details for debugging
        print(f"ClientError: {e}")
        error_message = e.response['Error']['Message']
        return {
            'statusCode': 400,
            'body': json.dumps({'error': error_message}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }

    except Exception as e:
        # Log any other exceptions for debugging
        print(f"Exception: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An internal server error occurred'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }
