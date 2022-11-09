import type { DocumentContext } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang={'en'}>
        <Head>
          <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap' rel='stylesheet' />
          <link rel='icon' type='image/webp' href='./flight-tracker/plane-orange.webp' />
        </Head>
        <body className='bg-dark font-roboto text-white-100 antialiased'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
