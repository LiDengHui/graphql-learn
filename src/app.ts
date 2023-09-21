import express from "express";
import {buildSchema} from "graphql";
import {graphqlHTTP} from "express-graphql";

// 使用 GraphQL Schema Language 创建一个 schema
const schema = buildSchema(`
  input MessageInput {
   content: String
   author: String
  }
  
  type Message {
    id: ID!
    content: String
    author: String
  }
  
  type Query {
    getMessage(id: ID!): Message
  }
  
  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`)
interface MessageInput {
  content: string
  author: string
}
class Message {
  id: string
  content: string
  author: string

  constructor(id: string, {content, author}: MessageInput) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}
const fakeDatabase: Record<string, MessageInput> = {};
// root 提供所有 API 入口端点相应的解析器函数
const root = {
  getMessage: ({id}: {id: string}) => {
    if(!id) throw new Error(`id is must`)

    if(!fakeDatabase[id]) {
      throw new Error('no message exists width id'+ id);
    }

    return new Message(id, fakeDatabase[id]);
  },
  createMessage: ({input}: { input:MessageInput }) => {
    let id = crypto.randomUUID();
    fakeDatabase[id] = input;
    console.log(input)
    return new Message(id, input);
  },

  updateMessage:({id, input}: {id: string, input:MessageInput}) => {
    if(!fakeDatabase[id]) {
      throw new Error('no message exists width id'+ id);
    }

    fakeDatabase[id] = input;
    return new Message(id, input)
  }
}


const app = express();

app.use(express.static('public'))
app.use(`/graphql`, graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))

app.listen(4000)

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
