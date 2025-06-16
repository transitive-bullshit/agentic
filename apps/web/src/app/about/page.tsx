import { cn } from '@/lib/utils'

import styles from './styles.module.css'

export default function AboutPage() {
  return (
    <>
      <section>
        <h1>About</h1>

        <div className={cn('prose dark:prose-invert', styles.markdown)}>
          <h2>Our Mission</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            <b>Ut enim ad minim veniam</b>, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h2>Our Story</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
            <em>Excepteur sint occaecat cupidatat non proident</em>, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <h2>Our Values</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>

          <h2>Our Team</h2>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>

          <h2>Our Technology</h2>
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos
            dolores et quas molestias <b>excepturi sint occaecati</b> cupiditate
            non provident.
          </p>

          <h2>Our Impact</h2>
          <p>
            Similique sunt in culpa qui officia deserunt mollitia animi, id est
            laborum et dolorum fuga.
            <em>Et harum quidem rerum facilis est et expedita distinctio</em>.
            Nam libero tempore, cum soluta nobis est eligendi optio.
          </p>

          <h2>Our Future</h2>
          <p>
            Temporibus autem quibusdam et aut officiis debitis aut rerum
            necessitatibus saepe eveniet ut et voluptates repudiandae sint et
            molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente
            delectus.
          </p>

          <h2>Our Community</h2>
          <p>
            Ut aut reiciendis voluptatibus maiores alias consequatur aut
            perferendis doloribus asperiores repellat. Sed ut perspiciatis unde
            omnis iste natus error sit voluptatem accusantium doloremque
            laudantium.
          </p>

          <h2>Our Commitment</h2>
          <p>
            Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
            quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat
            quo voluptas nulla pariatur?{' '}
            <b>Excepteur sint occaecat cupidatat non proident</b>.
          </p>
        </div>
      </section>
    </>
  )
}
