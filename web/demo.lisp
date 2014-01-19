(setq m 7)

(defun seed () (
  list 
(list 0 0 0 0 0 0 0)
(list 0 0 0 0 0 0 0)
(list 0 1 1 1 0 0 0)
(list 0 0 0 0 0 0 0)
(list 0 0 0 0 0 0 0)
(list 0 0 0 0 0 0 0)
(list 0 0 0 0 0 0 0)
))


(defun cell (state row col) (
  nth col (nth row state)
  ))

(defun count-live (state row col) (
  if (eq row 0) (+ (count-exact (nth row state) col) (count-neigh (nth (+ row 1) state) col) ) 
    (if (eq row (- m 1)) (  + (count-exact (nth row state) col) (count-neigh (nth (- row 1) state) col)   )
      (  + (count-exact (nth row state) col) (count-neigh (nth (+ row 1) state) col)  (count-neigh (nth (- row 1) state) col)  )
      )
  ))
(defun count-neigh (row index) (
  if (eq index 0) (+ (nth (+ index 1) row) (nth index row))
    (if (eq index (- m 1)) (+ (nth (- index 1) row) (nth index row)) 
      (+ (nth (- index 1) row ) (nth index row)  (nth (+ index 1) row ) ) 
      )
  ))

(defun count-exact (row index) (
  if (eq index 0) (nth (+ index 1) row)
    (if (eq index (- m 1)) (nth (- index 1) row) 
      (+ (nth (- index 1) row )  (nth (+ index 1) row ) ) 
      )
  ))

(defun evolve (state row) (
  if(> row (- m 2)) (cons (evolve-row state row 0) nil)
  (cons (evolve-row state row 0) (evolve state (+ 1 row)))
  ) )

(defun next-state (neighs curst) (
  if (> curst 0)
    (
      if (< neighs 2) 0
       (if (> neighs 3) 0 
        1)
    )
    (
      if (eq neighs 3) 1 0
    ) 

))

(defun evolve-row (state ri ci)  (print (list ri ci (next-state (count-live state ri ci) (nth ci (nth ri state)))   ))
  (
  if (> ci (- m 2)) (cons (next-state (count-live state ri ci) (nth ci (nth ri state))) nil)
    (cons (next-state (count-live state ri ci) (nth ci (nth ri state)))  (evolve-row state ri (+ ci 1))
      ))
)

(setq stanje (evolve (seed) 0))
(do ((iter 1 (+ iter 1))) ((> iter 20) 1) (setq  stanje (evolve stanje 0)))

