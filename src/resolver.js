const supportedTypes = new Set([
  'A',
  'AAAA',
  'CAA',
  'CNAME',
  'DS',
  'DNSKEY',
  'MX',
  'NS',
  'NSEC',
  'NSEC3',
  'RRSIG',
  'SOA',
  'TXT',
]);

const enumErrors = [
  { name: 'NoError', description: 'No Error' }, // 0
  { name: 'FormErr', description: 'Format Error' }, // 1
  { name: 'ServFail', description: 'Server Failure' }, // 2
  { name: 'NXDomain', description: 'Non-Existent Domain' }, // 3
  { name: 'NotImp', description: 'Not Implemented' }, // 4
  { name: 'Refused', description: 'Query Refused' }, // 5
  { name: 'YXDomain', description: 'Name Exists when it should not' }, // 6
  { name: 'YXRRSet', description: 'RR Set Exists when it should not' }, // 7
  { name: 'NXRRSet', description: 'RR Set that should exist does not' }, // 8
  { name: 'NotAuth', description: 'Not Authorized' }, // 9
];

/**
 * Parameter Parser
 *
 * @param {string} text Parameter
 * @returns Type and domain
 */
const parseParam = text => {
  const params = text.split(/\s+/);
  if (params.length >= 2) return [params[0].toUpperCase(), params[1]];
  else if (params.length === 1) return ['A', params[0]];
  return ['A', null];
};

/**
 * 1111 Resolver
 *
 * @param {string} text Parameter
 * @returns Message
 */
module.exports = async text => {
  const [type, domain] = parseParam(text);

  if (!supportedTypes.has(type)) return `Unsupported type \`${type}\``;
  if (!domain) return 'Missing domain name';

  const url = new URL('https://cloudflare-dns.com/dns-query');
  url.searchParams.append('name', domain);
  url.searchParams.append('type', type);

  const result = await fetch(url.href, {
    method: 'GET',
    headers: {
      accept: 'application/dns-json',
    },
  });

  if (result.status !== 200) return result.statusText;

  const { Status, Answer } = await result.json();

  if (Status !== 0) return `ERROR: ${enumErrors[Status].description}`;
  if (!Answer || !Answer.length) return `No \`${type}\` records for \`${domain}\``;

  const datas = Answer.map(({ data }) => data).filter(data => data);

  return `\`dig @1.1.1.1 ${type} ${domain}\`

${datas.join('\n')}`;
};
