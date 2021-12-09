import Head from "next/head";
import Link from "next/link";

const AboutUs = () => {

const { data, error } = useSWR('/api/user', fetch)

    return (
        <>
            <Head>
                <title>About page</title>
            </Head>
            <h1>ABOUT US</h1>
            <h2>
                <Link href="/">
                    <a>Back to home</a>
                </Link>
            </h2>
        </>
    )
}

export default memo(AboutUs);

