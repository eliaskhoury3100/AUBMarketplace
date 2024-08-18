# This AWS Lambda function handles user sign-up through Amazon Cognito. 
# It verifies that the email ends with `@mail.aub.edu`, 
# ensures that the password and confirmation match, 
# and includes a profile picture as a custom attribute. 
# If the sign-up is successful, it returns the user's Cognito ID; otherwise, it returns an appropriate error message.

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
        confirm_password = body.get('confirmPassword')
        profile_picture = body.get('profilepicture')  # Get the profile picture from the request body

        if not email or not password or not confirm_password:
            print("Error: Email, password, and confirm password are required.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email, password, and confirm password are required'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Check if the email ends with '@mail.aub.edu'
        if not email.endswith('@mail.aub.edu'):
            print("Error: Email must end with '@mail.aub.edu'.")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email must end with @mail.aub.edu'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        if password != confirm_password:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Passwords do not match'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                }
            }

        # Attempt to sign up the user
        response = client.sign_up(
            ClientId='4fii2i04p9mtnm9q9vajbaigkb',
            Username=email,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                },
                {
                'Name': 'custom:ProfilePicture',
                'Value': profile_picture  # Always add the profile picture attribute
            }
            ],
        )

        # Extract the user sub
        username = response['UserSub']
        print("Signup successful, username:", username)

        # Generate a successful response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User signed up successfully', 'username': username}),
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
