# This AWS Lambda function confirms a user's sign-up in Amazon Cognito by verifying the provided confirmation code. 
# It expects a JSON payload containing the `Username` and `verification_code`. 
# If the confirmation code is valid, it confirms the user's sign-up and returns a success message. 
# If there's an error during the process, 
# it returns an appropriate error message with the relevant HTTP status code. 
# The function includes headers to allow CORS (Cross-Origin Resource Sharing) for requests from any origin.

import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize the Cognito client
    client = boto3.client('cognito-idp', region_name='eu-north-1')

    # Log the incoming event for debugging
    print(f"Received event: {json.dumps(event)}")

    try:
        # Parse the JSON body from the request
        body = json.loads(event['body'])
        username=body.get('Username')
        verification_code = body.get('verification_code')

        

        # Check if verification code is provided
        if not verification_code:
            print("Error: Verification code is required.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Verification code is required'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                    'Access-Control-Allow-Headers': 'Content-Type, X-CSRFToken, Authorization',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Attempt to confirm the sign-up
        response = client.confirm_sign_up(
            ClientId='4fii2i04p9mtnm9q9vajbaigkb',
            Username=username,
            ConfirmationCode=verification_code,
        )

        # Generate a successful response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Verification successful!'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type, X-CSRFToken, Authorization',
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
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type, X-CSRFToken, Authorization',
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
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type, X-CSRFToken, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }
