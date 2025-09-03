import Navbar from "./Navbar";
import Hero from "./Hero/Hero";
import Footer from "./Footer";

const Landing = () => (
  <>
    <Navbar isHidden={false} loggedIn={false}> </Navbar>
    <Hero></Hero>
    <Footer></Footer>
  </>
);

export default Landing;
