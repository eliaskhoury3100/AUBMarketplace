# This AWS Lambda function handles adding messages to a DynamoDB table, 
# updates the conversation's last updated timestamp, and generates a conversation ID if one isn't provided. 
# It also creates new conversations if they don't exist.

import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    # Table name and setup
    table_name = 'Messages'
    table = dynamodb.Table(table_name)

    # Parse the body of the request
    body = json.loads(event['body'])
    message = body['message']
    convo_id = body.get('convo_id')  # Retrieve convo_id if provided

    # UTC timestamp in ISO 8601 format for SK of message and LastUpdated
    timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    # Extract additional data if available
    sender_id = body.get('user_id')
    product_id = body.get('ProductId', '')  # Default to empty string if not provided

    if convo_id:
        # If convo_id is directly provided, use it to add the message
        add_message_to_conversation(table, convo_id, sender_id, message, timestamp, product_id)
        
        # Update last updated timestamp if sender_id is available
        if sender_id:
            update_conversation_last_updated(table, sender_id, convo_id, timestamp)
    else:
        # Process user details to generate or use existing convo_id if all details are provided
        recipient_id = body.get('recipient_id')
        if not all([sender_id, recipient_id]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required user details for conversation creation'})
            }
        convo_id = generate_conversation_id(sender_id, recipient_id, product_id)
        
        # Check if the conversation already exists
        response = table.query(
            KeyConditionExpression=Key('PK').eq(f"User#{sender_id}") & Key('SK').eq(convo_id)
        )
        
        if not response['Items']:
            # No existing conversation, create new conversation metadata
            create_new_conversation(table, sender_id, recipient_id, convo_id, timestamp, product_id)

        # Add message to the conversation
        add_message_to_conversation(table, convo_id, sender_id, message, timestamp, product_id)
        # Update the conversation's last updated timestamp
        update_conversation_last_updated(table, sender_id, convo_id, timestamp)

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Operation completed successfully'})
    }

def generate_conversation_id(user_id, recipient_id, product_id):
    sorted_ids = sorted([user_id, recipient_id])
    return f"CONVO#{sorted_ids[0]}-{sorted_ids[1]}-{product_id}"

def create_new_conversation(table, user_id, recipient_id, convo_id, last_updated, product_id):
    users = [user_id, recipient_id]
    for user in users:
        table.put_item(
            Item={
                'PK': f"User#{user}",
                'SK': convo_id,
                'LastUpdated': last_updated,
                'Recipient': recipient_id if user == user_id else user_id,
                'ProductID': product_id 
            }
        )

def add_message_to_conversation(table, convo_id, sender_id, message, timestamp, product_id):
    table.put_item(
        Item={
            'PK': convo_id,
            'SK': timestamp,
            'SenderID': sender_id,
            'Message': message,
            'ProductID': product_id 
        }
    )

def update_conversation_last_updated(table, user_id, convo_id, timestamp):
    table.update_item(
        Key={
            'PK': f"User#{user_id}",
            'SK': convo_id
        },
        UpdateExpression="SET LastUpdated = :val",
        ExpressionAttributeValues={
            ':val': timestamp
        }
    )
