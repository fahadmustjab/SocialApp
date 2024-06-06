import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import mongoose, { Model, model, Schema } from 'mongoose';

const messageSchema: Schema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>('Conversation', messageSchema, 'Conversation');
export { ConversationModel };
