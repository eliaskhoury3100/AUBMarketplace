# This AWS Lambda function retrieves a specific product's details from a DynamoDB table based 
# on a given `product_id` and `category` (partition key). 
# It returns the product details if found or an appropriate error message 
# if the product is not found or if an error occurs during the query. The `DecimalEncoder` 
# class is used to convert DynamoDB `Decimal` types to `float` for JSON serialization.

import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or use str(obj) if you want to preserve exactness
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('AUBMarketPlaceMainTable')

    product_id = event['queryStringParameters']['id']
    category = event['queryStringParameters']['pk']
    print(product_id)

    try:
        response = table.query(
            KeyConditionExpression=Key('PK').eq(category) & Key('SK').eq(product_id)
        )
        
        if 'Items' in response and response['Items']:
            return {
                'statusCode': 200,
                'body': json.dumps(response['Items'], cls=DecimalEncoder),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Product not found'),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Error fetching product details'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
