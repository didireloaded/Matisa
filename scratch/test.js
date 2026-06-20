const url = 'https://fafpyshhhdqgvhhfycfc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZnB5c2hoaGRxZ3ZoaGZ5Y2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2NDA0NCwiZXhwIjoyMDk3MDQwMDQ0fQ.PE7042c2Hfi5QIIVOEbt7it1lFGwCIBXdYeD1_qj51Q';
const query = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        fields {
          name
        }
      }
    }
  }
`;
fetch(url + '/graphql/v1', {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
}).then(res => res.json()).then(data => {
  if (data.errors) {
    console.error(data.errors);
  } else {
    // filter for user tables, which typically have a type representing the table
    // However, maybe GraphQL is not completely 1:1 with DB schema if pg_graphql isn't fully enabled.
    console.log(JSON.stringify(data.data.__schema.types.filter(t => t.kind === 'OBJECT' && !t.name.startsWith('__')), null, 2));
  }
}).catch(console.error);
