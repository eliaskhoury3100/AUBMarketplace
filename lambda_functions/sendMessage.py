# This AWS Lambda function is designed to send a message to all participants in a WebSocket conversation.
# This setup is useful for real-time messaging applications where participants are connected via 
# WebSocket and you need to broadcast messages to all participants in a specific conversation.

import json
import boto3

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')
client = boto3.client('apigatewaymanagementapi', endpoint_url='https://your-api-id.execute-api.region.amazonaws.com/production')

def lambda_handler(event, context):
    message_data = json.loads(event['body'])
    convo_id = message_data['convo_id']
    sender_id = message_data['user_id']
    message = message_data['message']

    # Query for all the recipients in the conversation
    # Assuming you store conversation participants and their connection IDs
    recipients = connection_table.scan(
        FilterExpression=Attr('convo_id').eq(convo_id)
    )['Items']

    for recipient in recipients:
        connection_id = recipient['connection_id']

        try:
            client.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps({
                    'sender_id': sender_id,
                    'message': message
                })
            )
        except Exception as e:
            print(f"Error sending message: {str(e)}")
            connection_table.delete_item(Key={'connection_id': connection_id})

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Message sent'})
    }
