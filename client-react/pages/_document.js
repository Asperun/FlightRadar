import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps( ctx ) {
    const initialProps = await Document.getInitialProps(ctx);
    return {...initialProps};
  }

  render() {
    return (
        <Html>
          <Head>
            <link
                href="https://fonts.googleapis.com/css2?family=Lato&family=Oxygen&display=swap"
                rel="stylesheet"
            />
          </Head>
          <body className="font-lato">
          <Main />
          <NextScript />
          </body>
        </Html>
    );
  }
}

export default MyDocument;
