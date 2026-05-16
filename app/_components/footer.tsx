export default function Footer() {
  return (
    <footer className='py-4 text-center text-xs text-muted-foreground'>
      <p>
        Maintained by{' '}
        <a
          href='https://github.com/FrCl2000/archero2-dice-companion'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-foreground transition-colors'
        >
          FrCl2000
        </a>
        {' · '}
        Originally created by{' '}
        <a
          href='https://ko-fi.com/ksun4176'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-foreground transition-colors'
        >
          ksun4176
        </a>
        {' '}— most of the code is his work.
      </p>
    </footer>
  );
}
