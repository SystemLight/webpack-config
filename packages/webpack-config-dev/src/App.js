import styles from './styles.css'
import styles2 from './styles.module.css'

console.log(styles)
console.log(styles2)
export default function App() {
  return (
    <div className={styles2.rect}>Hello react</div>
  )
}
