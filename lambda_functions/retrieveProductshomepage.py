# This AWS Lambda function queries a DynamoDB table for items with a specific `PRODUCT` value and an `SK` 
# that begins with "ITEM#". It returns the found items or an appropriate error message 
# if no items are found or if an error occurs. The function also handles `Decimal` types 
# in the response, converting them to strings for JSON serialization.

import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return str(obj)  # Convert Decimal to string for JSON serialization

def lambda_handler(event, context):
    # Reference the DynamoDB table
    table = dynamodb.Table('AUBMarketPlaceMainTable')

    try:
        response = table.query(
            IndexName='PRODUCT-SK-index',
            KeyConditionExpression=Key('PRODUCT').eq('product') & Key('SK').begins_with('ITEM#')
        )

        # Check if the response has items
        if 'Items' in response and response['Items']:
            return {
                'statusCode': 200,
                'body': json.dumps(response['Items'], default=decimal_default),  # Use custom decimal handler
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'No products found'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
    except Exception as e:
        print(e)  # Good practice to log the exception
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
