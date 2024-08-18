# This AWS Lambda function retrieves messages from a DynamoDB table based on a 
# conversation ID (`convo_id`). The conversation ID can be directly provided, or it 
# can be constructed using `user_id`, `recipient_id`, and `product_id`. The function 
# returns the messages associated with the conversation or an error message if something goes wrong.

import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_name = 'Messages'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Log the entire event
    
    query_params = event.get('queryStringParameters', {})
    print("Query parameters:", query_params)  # Log the query parameters
    
    # Safely get parameters or None if they don't exist
    convo_id = query_params.get('convo_id')
    user_id = query_params.get('user_id')
    recipient_id = query_params.get('recipient_id')
    product_id = query_params.get('product_id')

    print(f"convo_id: {convo_id}, user_id: {user_id}, recipient_id: {recipient_id}, product_id: {product_id}")  # Log the individual parameters

    if convo_id:
        # Case 2: convoID is provided directly
        conversation_key = convo_id
        print(f"Using convo_id directly: {conversation_key}")
    elif user_id and recipient_id and product_id:
        # Case 1: Construct convoID from user_id, recipient_id, and product_id
        sorted_ids = sorted([user_id, recipient_id])
        conversation_key = f"CONVO#{sorted_ids[0]}-{sorted_ids[1]}-{product_id}"
        print(f"Constructed convo_id: {conversation_key}")
    else:
        print("Missing required parameters")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing required parameters'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    # Query DynamoDB for messages in this conversation
    try:
        print(f"Querying DynamoDB with conversation_key: {conversation_key}")
        response = table.query(
            KeyConditionExpression=Key('PK').eq(conversation_key)
        )
        print(f"DynamoDB query response: {response['Items']}")
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items']),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")  # Log the exception
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
