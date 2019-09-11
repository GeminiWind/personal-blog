
module.exports = {
  pathPrefix: '/gatsby-starter-developer-blog',
  siteUrl: 'https://blog.haidv.me',
  siteTitle: 'Hai DV',
  siteDescription: 'Blog about world of coding',
  author: 'HaiDV',
  postsForArchivePage: 3,
  defaultLanguage: 'en',
  disqusScript: 'https://luigi-colella.disqus.com/embed.js',
  pages: {
    home: '/',
    blog: '/',
    about: 'about',
    tag: 'tag',
    archive: 'archive'
  },
  social: {
    github: 'https://github.com/GeminiWind',
    linkedin: 'https://linkedin.com/in/đinh-văn-hải-448505141',
    rss: '/rss.xml'
  },
  tags: {
    aws: {
      name: 'AWS',
      description: 'Amazon web service is a platform that offers flexible, reliable, scalable, easy-to-use and cost-effective cloud computing solutions.'
    },
    javascript: {
      description: 'JavaScript is an object-oriented programming language used alongside HTML and CSS to give functionality to web pages.'
    },
    nodejs: {
      name: 'Node.js',
      description: 'Node.js is a tool for executing JavaScript in a variety of environments.'
    },
    react: {
      description: 'React is an open source JavaScript library used for designing user interfaces.'
    }
  }
}