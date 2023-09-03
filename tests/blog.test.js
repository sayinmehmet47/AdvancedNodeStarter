const Page = require('./helpers/page');

describe('When logged in', () => {
  let page;
  beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
    await page.login();
    await page.click('a.btn-floating');
  });

  afterEach(async () => {
    await page.close();
  });

  test('should see blog form after login', async () => {
    const label = await page.getContentsOf('form label');
    const contentLabel = await page.getContentsOf('form .content label');
    expect(label).toEqual('Blog Title');
    expect(contentLabel).toEqual('Content');
  });

  test('should add blog after login', async () => {
    await page.type('.title input', 'new title');
    await page.type('.content input', 'My Content');
    await page.click('form button');
    expect(page.url()).toEqual('http://localhost:3000/blogs/new');
    await page.click('button.green');
    await page.waitFor('.card');
    const title = await page.getContentsOf('.card-title');
    const content = await page.getContentsOf('p');
    expect(title).toEqual('new title');
    expect(content).toEqual('My Content');
  });

  test('should show error message if invalid inputs', async () => {
    await page.click('form button');
    const titleError = await page.getContentsOf('.title .red-text');
    const contentError = await page.getContentsOf('.content .red-text');
    expect(titleError).toEqual('You must provide a value');
    expect(contentError).toEqual('You must provide a value');
  });
});

describe('When not logged in', () => {
  let page;
  beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  test('should not add blog after login', async () => {
    const result = await page.post('/api/blogs', {
      title: 'My Title',
      content: 'My Content',
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('should not get blogs after login', async () => {
    const result = await page.get('/api/blogs');
    expect(result).toEqual({ error: 'You must log in!' });
  });
});
