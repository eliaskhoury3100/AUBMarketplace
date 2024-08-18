# This AWS Lambda function resets a user's password in a 
# Cognito User Pool by confirming the password reset process using a verification code. 
# It checks if the password and confirmation match, handles errors, and returns appropriate status codes and messages.

import json
import boto3
from botocore.exceptions import ClientError

# Initialize the Cognito client
client = boto3.client('cognito-idp', region_name='eu-north-1')

def lambda_handler(event, context):
    # Log the incoming event for debugging
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse the JSON body from the request
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        password = body.get('password')
        confirm_password = body.get('confirmPassword')
        verification_code = body.get('verificationCode')

       

        # Check if the password and confirm password match
        if password != confirm_password:
            print("Error: Passwords do not match.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Passwords do not match.'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Attempt to confirm the forgot password process
        response = client.confirm_forgot_password(
            ClientId='4fii2i04p9mtnm9q9vajbaigkb',
            Username=username,
            Password=password,
            ConfirmationCode=verification_code
        )
        
        # Log the response for debugging
        print(f"Response from confirm_forgot_password: {response}")

        # Generate a successful response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Password has been reset successfully.'}),
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
