/** *************************************************************
 * Any file inside the folder pages/api is mapped to /api/* and *
 * will be treated as an API endpoint instead of a page.        *
 ****************************************************************/

import sgMail from '@sendgrid/mail'
import sgClient from '@sendgrid/client'

function randNum() {
  return Math.floor(Math.random() * 90000) + 10000;
}

async function addContact(firstName, lastName, email, confNum) {
  const customFieldID = await getCustomFieldID('conf_num');
  const data = {
    "contacts": [{
      "email": email,
      "first_name": firstName,
      "last_name": lastName,
      "custom_fields": {}
    }]
  };
  data.contacts[0].custom_fields[customFieldID] = confNum;
  const request = {
    url: `/v3/marketing/contacts`,
    method: 'PUT',
    body: data
  }
  return sgClient.request(request);
}

async function getCustomFieldID(customFieldName) {
  const request = {
    url: `/v3/marketing/field_definitions`,
    method: 'GET',
  }
  const response = await sgClient.request(request);
  const allCustomFields = response[1].custom_fields;
  return allCustomFields.find(x => x.name === customFieldName).id;
}

const subscribe = async (req, res) => {

  const { firstname, lastname, email } = req.body

  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Request method is not allowed.' })
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  try {
    const confNum = randNum();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgClient.setApiKey(process.env.SENDGRID_API_KEY);

    const response = await addContact(firstname, lastname, email, confNum);

    if (response[0].statusCode >= 400) {
      return res.status(400).json({ error: 'There was an error subscribing to the list.' })
    }

    return res.status(201).json({ error: '' })
  } catch (error) {
    return res.status(500).json({ error: error.message || error.toString() })
  }
}

export default subscribe
