# Deletes the WebSocket connection ID from the DynamoDB table upon client disconnection.

import json
import boto3

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']

    # Delete the connection ID from DynamoDB
    connection_table.delete_item(
        Key={'connection_id': connection_id}
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Disconnected'})
    }
