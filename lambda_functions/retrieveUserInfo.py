# This AWS Lambda function retrieves user information from a Cognito User Pool based on the `userId` 
# provided as a query parameter. It returns the user's attributes if found, 
# handles cases where the user is not found, and manages other potential errors 
# with appropriate HTTP status codes and messages.

import json
import boto3

# Initialize a Cognito Identity Provider client
cognito_idp = boto3.client('cognito-idp')

def lambda_handler(event, context):
    # Extract the userId from the event object
    userId = event['queryStringParameters']['userId']
    user_pool_id = 'eu-north-1_yY06qHPlb'  # Replace with your actual Cognito User Pool ID
    
    # Retrieve the user information from Cognito
    try:
        response = cognito_idp.admin_get_user(
            UserPoolId=user_pool_id,
            Username=userId
        )
        
        # Prepare user attributes to return
        user_attributes = {attr['Name']: attr['Value'] for attr in response['UserAttributes']}
        
        return {
            'statusCode': 200,
            'body': json.dumps(user_attributes),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    
    except cognito_idp.exceptions.UserNotFoundException:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'User not found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print('Error:', e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error processing request', 'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }
