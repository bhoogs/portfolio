import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Industries from "@/components/Industries";
import Books from "@/components/Books";
import Videos from "@/components/Videos";
import Lists from "@/components/Lists";
import Hobbies from "@/components/Hobbies";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Industries />
        <Books />
        <Videos />
        <Lists />
        <Hobbies />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
