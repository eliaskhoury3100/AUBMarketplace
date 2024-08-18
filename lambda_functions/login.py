# This AWS Lambda function handles user authentication with Amazon Cognito. 
# It verifies the provided email and password, and if the credentials are 
# correct, it returns an authentication result that includes tokens (access, ID, refresh) 
# and the user's unique ID. If the authentication fails or an error occurs, 
# it returns an appropriate error message with corresponding HTTP status codes.

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
        email = body.get('email')
        password = body.get('password')

        # Check if email and password are provided
        if not email or not password:
            print("Error: Email and password are required.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email and password are required'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Attempt to authenticate the user
        auth_response = client.initiate_auth(
            ClientId='4fii2i04p9mtnm9q9vajbaigkb',
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password,
            }
        )

        # Extract the authentication result
        auth_result = auth_response['AuthenticationResult']
        access_token = auth_result['AccessToken']
        id_token = auth_result['IdToken']
        refresh_token = auth_result['RefreshToken']

        # Get user info using access token to retrieve the User-Id (sub)
        user_info = client.get_user(
            AccessToken=access_token
        )
        user_id = next(attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'sub')

        # Log successful authentication for debugging
        print(f"Authentication successful: {auth_result}")

        # Generate a successful response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Login successful',
                'authResult': {
                    'accessToken': access_token,
                    'idToken': id_token,
                    'refreshToken': refresh_token,
                    'userId': user_id
                }
            }),
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
            'statusCode': 401,
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
