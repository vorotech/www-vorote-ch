export const siteConfig = {
  header: {
    name: "Dmytro's Radar",
    icon: {
      name: 'BiRadar',
      color: 'teal',
      style: 'float',
    },
    nav: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/posts', label: 'Blog' },
      { href: '/tools', label: 'Tools' },
      { href: 'https://www.linkedin.com/in/dmytro-vorotyntsev/', label: 'LinkedIn' },
    ],
  },
  footer: {
    social: [
      { icon: 'BiMailSend', url: 'mailto:hello@vorote.ch' },
      { icon: 'FaLinkedin', url: 'https://www.linkedin.com/in/dmytro-vorotyntsev/' },
      { icon: 'FaGithub', url: 'https://github.com/vorotech' },
      { icon: 'FaXTwitter', url: 'https://x.com/vorotech' },
    ],
  },
  theme: {
    color: 'teal',
    font: 'sans',
    darkMode: 'light',
  },
};
