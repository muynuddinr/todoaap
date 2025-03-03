import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, category, description, dueDate, completed } = await request.json();
    const { db } = await connectToDatabase();
    
    const result = await db.collection('tasks').insertOne({
      title,
      category,
      description,
      dueDate,
      completed,
      createdAt: new Date(),
    });

    const newTask = await db.collection('tasks').findOne({ _id: result.insertedId });
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
} 