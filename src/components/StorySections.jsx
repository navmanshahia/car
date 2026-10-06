import { motion } from 'framer-motion'

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: .35 },
  transition: { duration: .8, ease: [0.2, 0.8, 0.2, 1] }
}

export default function StorySections() {
  return (
    <div className="story-wrap">
      <section className="editorial-section section-form">
        <motion.div className="section-index" {...reveal}>01 / FORM</motion.div>
        <motion.div className="editorial-copy" {...reveal}>
          <p className="eyebrow">Sculpted in one gesture</p>
          <h2>Less decoration.<br /><em>More tension.</em></h2>
          <p>The S·01 concept uses a long hood, compact glasshouse and a single metallic datum line. Every surface is designed to catch light once—then disappear back into shadow.</p>
        </motion.div>
        <motion.div className="material-orbit" {...reveal}>
          <span className="orbit-ring ring-one" />
          <span className="orbit-ring ring-two" />
          <span className="metal-core">S·01</span>
        </motion.div>
      </section>

      <section className="editorial-section section-material">
        <motion.div className="section-index" {...reveal}>02 / MATERIAL</motion.div>
        <motion.div className="material-cards" {...reveal}>
          <article><span>01</span><h3>Deep lacquer</h3><p>Paint behaves like depth, not colour. Metallic flake is restrained so the form stays readable.</p></article>
          <article><span>02</span><h3>Warm metal</h3><p>Champagne-finished detailing replaces bright chrome with a quieter, architectural accent.</p></article>
          <article><span>03</span><h3>Tailored cabin</h3><p>Leather, technical textile and dark glass are layered like an interior rather than a cockpit prop.</p></article>
        </motion.div>
      </section>

      <section className="editorial-section section-commission">
        <motion.div className="commission-line" {...reveal}><span>ONE MACHINE</span><span>YOUR MATERIAL LANGUAGE</span><span>NO PRESET PERSONALITY</span></motion.div>
        <motion.div className="commission-copy" {...reveal}>
          <p className="eyebrow">Private digital coachbuilding</p>
          <h2>Configuration is not a menu.<br /><em>It is authorship.</em></h2>
        </motion.div>
      </section>
    </div>
  )
}
