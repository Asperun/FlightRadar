import Document, { Head, Html, Main, NextScript } from "next/document";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

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
          <body className="h-screen w-screen font-lato text-gray-900">
          <NavBar />
          <Main />
          <NextScript />
          <Footer />
          </body>
        </Html>
    );
  }
}

export default MyDocument;
