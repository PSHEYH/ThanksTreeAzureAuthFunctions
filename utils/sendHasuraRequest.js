const axios = require('axios');

async function sendHasuraRequest(query, variables, context) {

    const response = await axios.post(process.env.HGE_ENDPOINT, {
        query: query,
        variables: variables
    }, {
        headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': process.env.ADMIN_SECRET }
    });

    if (response.data?.errors != undefined) {
        context.log(json.errors);
    }

    return response.data;
}

module.exports = sendHasuraRequest;