import Image from 'next/image';
import VoiceRecorder from './components/VoiceRecorder/VoiceRecorder';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/fluidai.jpeg"
            alt="Breast Cancer AI Assistant Logo"
            width={60}
            height={60}
            className={styles.logo}
          />
          <h1 className={styles.title}>Breast Cancer AI Assistant</h1>
        </div>
      </header>
      <main className={styles.main}>
        <VoiceRecorder />
      </main>
      <footer className={styles.footer}>
        <p>Powered by AI • Made with 💗</p>
      </footer>
    </div>
  );
}