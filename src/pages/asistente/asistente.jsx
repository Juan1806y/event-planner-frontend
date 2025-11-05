import React from 'react';
import styles from './asistentePanel.module.css';
import Header from '../../layouts/Header/header';
import Footer from '../../layouts/FooterAsistente/footer';
import Evento from '../evento/evento';


const AsistentePanel = () => {
	return (
		<div className={styles.asistentePanel}>
			<Header />
			<Evento />
			<Footer />
			
		</div>);
};

export default AsistentePanel;
