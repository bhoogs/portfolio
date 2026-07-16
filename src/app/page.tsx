import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Certifications from "@/components/Certifications";
import Projects from "@/components/Projects";
import BlogPosts from "@/components/BlogPosts";
import Videos from "@/components/Videos";
import Lists from "@/components/Lists";
import Hobbies from "@/components/Hobbies";
import References from "@/components/References";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ClientLogos />
        <Certifications />
        <Projects />
        <References />
        <BlogPosts />
        <Lists />
        <Videos />
        <Hobbies />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
