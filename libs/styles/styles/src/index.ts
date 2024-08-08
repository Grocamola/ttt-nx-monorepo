
export * from './lib/styles';
import styles from './styles.module.css';

export function getStyles(): string {
  return styles.modal; 
}