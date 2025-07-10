import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { faker } from '@faker-js/faker'

// Create server instance
const server = new McpServer({
  name: 'faker',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
})

// Generate person data
server.tool(
  'generate_person',
  'Generate fake person data including name, email, phone, job, avatar, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of people to generate'),
  },
  async ({ count }) => {
    const people = Array.from({ length: count }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate(),
      avatar: faker.image.avatar(),
      bio: faker.person.bio(),
      jobTitle: faker.person.jobTitle(),
      gender: faker.person.gender(),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(people, null, 2),
      }],
    }
  },
)

// Generate address data
server.tool(
  'generate_address',
  'Generate fake address data including street, city, country, coordinates, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of addresses to generate'),
  },
  async ({ count }) => {
    const addresses = Array.from({ length: count }, () => ({
      streetAddress: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zipCode: faker.location.zipCode(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      timeZone: faker.location.timeZone(),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(addresses, null, 2),
      }],
    }
  },
)

// Generate company data
server.tool(
  'generate_company',
  'Generate fake company data including name, industry, website, contact info, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of companies to generate'),
  },
  async ({ count }) => {
    const companies = Array.from({ length: count }, () => ({
      name: faker.company.name(),
      industry: faker.company.buzzPhrase(),
      description: faker.company.catchPhrase(),
      website: faker.internet.url(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      employees: faker.number.int({ min: 1, max: 10000 }),
      founded: faker.date.past({ years: 50 }),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(companies, null, 2),
      }],
    }
  },
)

// Generate product data
server.tool(
  'generate_product',
  'Generate fake product data including name, price, description, SKU, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of products to generate'),
  },
  async ({ count }) => {
    const products = Array.from({ length: count }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
      category: faker.commerce.department(),
      material: faker.commerce.productMaterial(),
      color: faker.color.human(),
      sku: faker.string.alphanumeric(8),
      barcode: faker.string.numeric(12),
      weight: faker.number.float({ min: 0.1, max: 100 }) + ' lbs',
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(products, null, 2),
      }],
    }
  },
)

// Generate financial data
server.tool(
  'generate_finance',
  'Generate fake financial data including account numbers, credit cards, transactions, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of financial records to generate'),
  },
  async ({ count }) => {
    const finances = Array.from({ length: count }, () => ({
      accountNumber: faker.finance.accountNumber(),
      routingNumber: faker.finance.routingNumber(),
      creditCardNumber: faker.finance.creditCardNumber(),
      creditCardCVV: faker.finance.creditCardCVV(),
      iban: faker.finance.iban(),
      bic: faker.finance.bic(),
      bitcoin: faker.finance.bitcoinAddress(),
      amount: faker.finance.amount(),
      transactionType: faker.finance.transactionType(),
      currency: faker.finance.currencyCode(),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(finances, null, 2),
      }],
    }
  },
)

// Generate internet data
server.tool(
  'generate_internet',
  'Generate fake internet data including emails, URLs, IPs, usernames, etc.',
  {
    count: z.number().min(1).max(100).default(1).describe('Number of internet records to generate'),
  },
  async ({ count }) => {
    const internet = Array.from({ length: count }, () => ({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      url: faker.internet.url(),
      domain: faker.internet.domainName(),
      ip: faker.internet.ip(),
      ipv6: faker.internet.ipv6(),
      mac: faker.internet.mac(),
      userAgent: faker.internet.userAgent(),
      color: faker.internet.color(),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(internet, null, 2),
      }],
    }
  },
)

// Generate custom data
server.tool(
  'generate_custom',
  'Generate custom fake data of a specific type',
  {
    type: z.enum([
      'firstName', 'lastName', 'fullName', 'email', 'phone', 'address', 'city', 'country',
      'company', 'jobTitle', 'productName', 'price', 'color', 'animal', 'vehicle',
      'isbn', 'uuid', 'password', 'url', 'username', 'avatar', 'date', 'word', 'sentence', 'paragraph',
    ]).describe('Type of fake data to generate'),
    count: z.number().min(1).max(100).default(1).describe('Number of items to generate'),
  },
  async ({ type, count }) => {
    const generateCustomData = (type: string) => {
      switch (type) {
        case 'firstName': return faker.person.firstName()
        case 'lastName': return faker.person.lastName()
        case 'fullName': return faker.person.fullName()
        case 'email': return faker.internet.email()
        case 'phone': return faker.phone.number()
        case 'address': return faker.location.streetAddress()
        case 'city': return faker.location.city()
        case 'country': return faker.location.country()
        case 'company': return faker.company.name()
        case 'jobTitle': return faker.person.jobTitle()
        case 'productName': return faker.commerce.productName()
        case 'price': return faker.commerce.price()
        case 'color': return faker.color.human()
        case 'animal': return faker.animal.type()
        case 'vehicle': return faker.vehicle.vehicle()
        case 'isbn': return faker.commerce.isbn()
        case 'uuid': return faker.string.uuid()
        case 'password': return faker.internet.password()
        case 'url': return faker.internet.url()
        case 'username': return faker.internet.userName()
        case 'avatar': return faker.image.avatar()
        case 'date': return faker.date.recent()
        case 'word': return faker.lorem.word()
        case 'sentence': return faker.lorem.sentence()
        case 'paragraph': return faker.lorem.paragraph()
        default: return faker.lorem.word()
      }
    }

    const customData = Array.from({ length: count }, () => generateCustomData(type))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(customData, null, 2),
      }],
    }
  },
)

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Faker MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
