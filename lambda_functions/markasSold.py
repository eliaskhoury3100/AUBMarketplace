# This AWS Lambda function handles the process of marking a product as "sold" in a DynamoDB table. 
# It takes a `product_id` as a query string parameter, 
# queries the `AUBMarketPlaceMainTable` using a secondary index (`PRODUCT-SK-index`) 
# to find the corresponding product, 
# and then updates the product's state to "sold". 
# If the product is found and successfully updated, 
# it returns a success message; otherwise, 
# it returns an appropriate error message based on the situation (e.g., product not found, internal server error).

import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('AUBMarketPlaceMainTable')

def lambda_handler(event, context):
    index_name = 'PRODUCT-SK-index'
    product_id = event.get('queryStringParameters', {}).get('id', '')
    
    print("Received event:", json.dumps(event))
    print("Querying with Product ID:", product_id)

    try:
        # Query the item from the table using the secondary index
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression='PRODUCT = :product_val AND SK = :sk_val',
            ExpressionAttributeValues={
                ':product_val': 'product',
                ':sk_val': product_id
            }
        )

        items = response.get('Items', [])
        if not items:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Product not found'})
            }
        
        # Assuming there's only one item returned, get its primary key
        item = items[0]
        
        # Update the item to set the State to 'sold'
        update_response = table.update_item(
            Key={
                'PK': item['PK'],
                'SK': item['SK']
            },
            UpdateExpression="set #state = :state_val",
            ExpressionAttributeNames={
                '#state': 'State'
            },
            ExpressionAttributeValues={
                ':state_val': 'sold'
            },
            ReturnValues="UPDATED_NEW"
        )
        
        

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Product state updated to sold'})
        }
    
    except Exception as e:
        print("Error occurred:", str(e))
        
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
