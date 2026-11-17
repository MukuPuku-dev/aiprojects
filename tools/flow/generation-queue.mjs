export function createGenerationQueue(generate) {
  let tail = Promise.resolve();
  const jobs = new Map();
  let pending = 0;

  function enqueue(input, onStart = () => {}) {
    pending++;
    const run = tail.then(() => {
      onStart();
      return generate(input);
    });
    tail = run.catch(() => {});
    run.then(() => { pending--; }, () => { pending--; });
    return run;
  }

  function submit(id, input) {
    if (jobs.has(id)) throw new Error('Job ID already exists.');
    const job = { id, day: input.day, status: 'queued' };
    jobs.set(id, job);
    enqueue(input, () => { job.status = 'running'; }).then(
      result => { job.status = 'completed'; job.result = result; },
      error => { job.status = 'failed'; job.error = error.message; }
    );
    return job;
  }

  return { enqueue, submit, get: id => jobs.get(id), busy: () => pending > 0 };
}
