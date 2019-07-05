import React from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import styled from 'styled-components';

import Layout from '../components/Layout';
import SEO from '../components/SEO';
import HeaderBack from '../components/HeaderBack';

import HeadingPrimary from '../elements/HeadingPrimary';
import TextBody from '../elements/TextBody';
import Button from '../elements/Button';

const ImgDiv = styled.div`
  margin: 0 5% 5vh 5%;

  @media (max-width: 849px) {
    margin: 0 0 5vh 0;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10vh;

  @media (max-width: 849px) {
    flex-direction: column;
  }
`;

function Info({ data }) {
  return (
    <>
      <SEO title="About" />
      <HeaderBack />
      <Layout>
        <HeadingPrimary>About</HeadingPrimary>
        <ImgDiv>
          <Img fluid={data.PersonalPhoto.childImageSharp.fluid} />
        </ImgDiv>
        <TextBody>
          I’m HaiDV – coder, gamer, book lover.
          <br />
          <br />
          I love to build new stuff. It can be minor, a utility tool or can be a big app.
          <br />
          <br />
          I like reading books. My favorite books are <i>Code Clean</i>, <i>Code Complete</i>.
          <br />
          <br />
          If you’d like to know a few milestones in my journey, visit this page.
          I love to talk about tech, working experience and so on. Got something to share? Please get in touch with me.
          <br />
          <br />
          Have a great day! or night?
        </TextBody>
        <ButtonWrapper>
          <a href="mailto:gemini.wind285&#64;email.com">
            <Button>Get in touch</Button>
          </a>
        </ButtonWrapper>
      </Layout>
    </>
  );
}

export default Info;

export const query = graphql`
  query {
    PersonalPhoto: file(relativePath: { eq: "PersonalPhoto.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1400) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`;
