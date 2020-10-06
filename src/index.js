import Post from '@models/Post';
import './styles/styles.css';
import logo from './assets/logo.jpg';
import './styles/less.less';
import './styles/scss.scss';
import './babel.js';

const post = new Post('Webpack post title', logo);

document.querySelector('pre').innerHTML = post;
