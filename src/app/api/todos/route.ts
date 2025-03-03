import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function GET() {
  try {
    const client = await getClient();
    const database = client.db('todoapp');
    const todos = database.collection('todos');
    const todosList = await todos.find({}).toArray();
    
    if (!todosList) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(todosList);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const client = await getClient();
    const database = client.db('todoapp');
    const todos = database.collection('todos');
    
    const result = await todos.insertOne({
      text,
      completed: false,
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      _id: result.insertedId,
      text,
      completed: false,
    });
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    return NextResponse.json({ error: 'Failed to add todo' }, { status: 500 });
  }
} 