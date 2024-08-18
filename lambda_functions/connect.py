# This AWS Lambda function stores a WebSocket connection ID along with a user ID in a DynamoDB table 
# named `chatting`. When a client connects, the function extracts the connection ID and user ID, 
# and saves this pair in DynamoDB. The function then returns a success message confirming the connection.

import json
import boto3

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('chatting')

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']
    user_id = event['queryStringParameters'].get('user_id')  # Assuming user_id is passed as a query parameter

    # Store the connection ID with the user ID in DynamoDB
    connection_table.put_item(
        Item={
            'user_id': user_id,
            'connection_id': connection_id
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Connected'})
    }
