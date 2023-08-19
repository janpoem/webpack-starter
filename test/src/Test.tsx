import Svg from './img/3.svg';
import Image from './img/2.webp';
import styles from './Test.module.css';

export function Test() {
  return (
    <div className={styles.flex}>
      <div className={styles.flexCol}>
        <Svg width={20} height={20} color={'red'} />
        <div>remove width|height</div>
      </div>
      <span className="svg-icon" />
      <img src={Image} style={{ width: 400 }} alt="test img" />
      Test test ok
    </div>
  );
}
