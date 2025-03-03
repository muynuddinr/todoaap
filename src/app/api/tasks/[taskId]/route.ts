import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { completed } = await request.json();
    
    const { db } = await connectToDatabase();
    
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { completed } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { db } = await connectToDatabase();
    
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(taskId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 