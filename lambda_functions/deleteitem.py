# This AWS Lambda function deletes items from a DynamoDB table based on a provided `product_id`. 
# It queries the table using a secondary index, retrieves all matching items, 
# and attempts to delete each one. If any deletions fail, it collects the errors and 
# returns them in the response. If the query itself fails, it returns an error message with details from DynamoDB.

import boto3
import json
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('AUBMarketPlaceMainTable')
    index_name = 'PRODUCT-SK-index'
    
    # Get the productId from the event, which is passed as a query parameter
    product_id = event.get('queryStringParameters', {}).get('id', '')
    
    print("Received event:", event)  # Debugging: Print the full received event
    print("Querying with Product ID:", product_id)  # Debugging: Confirm Product ID to be queried

    try:
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression='PRODUCT = :product_val AND SK = :sk_val',
            ExpressionAttributeValues={
                ':product_val': 'product',
                ':sk_val': product_id
            }
        )
        items = response['Items']
        print("Query response items:", items)  # Debugging: Print the items retrieved from the query
        
        errors = []
        for item in items:
            try:
                print(f"Attempting to delete item with PK (Category): {item['PK']} and SK (Item Number): {item['SK']}")
                table.delete_item(
                    Key={
                        'PK': item['PK'],
                        'SK': item['SK']
                    }
                )
                print(f"Deleted item with PK (Category): {item['PK']} and SK (Item Number): {item['SK']}.")
            except Exception as e:
                error_message = f"Error deleting item with PK: {item['PK']} and SK: {item['SK']}: {str(e)}"
                print(error_message)
                errors.append(error_message)
        
        if errors:
            return {
                'statusCode': 400,
                'body': json.dumps({"message": "Errors occurred during deletion", "errors": errors})
            }
        
        return {
            'statusCode': 200,
      
        }

    except ClientError as e:
        print("Error querying DynamoDB:", e.response['Error']['Message'])  # Debugging: Print error message from DynamoDB
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error querying table', 'error': e.response['Error']['Message']})
        }

