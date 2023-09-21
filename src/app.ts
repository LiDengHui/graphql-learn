import express from "express";
import {buildSchema, GraphQLInputObjectType, GraphQLObjectType, GraphQLSchema, GraphQLString} from "graphql";
import {graphqlHTTP} from "express-graphql";

// 使用 GraphQL Schema Language 创建一个 schema
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



const MessageType = new GraphQLObjectType({
  name: "Message",
  fields: {
    id: {type: GraphQLString},
    content: {type: GraphQLString},
    author: {type: GraphQLString}
  }
})

const MessageInputType = new GraphQLInputObjectType({
  name: "MessageInput",
  fields: {
    content: {type: GraphQLString},
    author: {type: GraphQLString}
  }
})

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    getMessage: {
      type: MessageType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: (_, {id}: { id: string }) => {
        if (!id) throw new Error(`id is must`)

        if (!fakeDatabase[id]) {
          throw new Error('no message exists width id' + id);
        }

        return new Message(id, fakeDatabase[id]);
      }
    }
  }
})

const MutationsType = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    createMessage: {
      type: MessageType,
      args: {
        input: {type: MessageInputType}
      },
      resolve: (_, {input}: { id: string, input: MessageInput }) => {
        let id = crypto.randomUUID();
        fakeDatabase[id] = input;
        console.log(input)
        return new Message(id, input);
      }
    },
    updateMessage: {
      type: MessageType,
      args: {
        id: {type: GraphQLString},
        input: {type: MessageInputType}
      },
      resolve: (_, {id, input}: { id: string, input: MessageInput }) => {
        if (!fakeDatabase[id]) {
          throw new Error('no message exists width id' + id);
        }

        fakeDatabase[id] = input;
        return new Message(id, input)
      }
    }

  }
})
const app = express();
const schema = new GraphQLSchema({ query: QueryType,mutation: MutationsType  })

app.use(express.static('public'))
app.use(`/graphql`, graphqlHTTP({
  schema,
  graphiql: true
}))

app.listen(4000)

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
