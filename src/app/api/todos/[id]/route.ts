import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { completed } = await request.json();
    await client.connect();
    const database = client.db('todoapp');
    const todos = database.collection('todos');
    await todos.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { completed } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await client.connect();
    const database = client.db('todoapp');
    const todos = database.collection('todos');
    await todos.deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  } finally {
    await client.close();
  }
} 