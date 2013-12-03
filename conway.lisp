(setq len 5)

(defun seed () (
  list 
  (list 1 1 0 0 0) 
  (list 1 1 1 1 0) 
  (list 0 1 1 1 1) 
  (list 1 1 1 1 0) 
  (list 0 0 0 0 0)
))
;;;3 4 4 2 1
;;;4 6 6 4 3
;;;5 7 8 6 3 
;;;2 4 5 4 3
;;;2 3 3 2 1

;;;1 0 0 1 0
;;;0 0 0 0 1
;;;0 0 0 0 1 
;;;1 0 0 0 1
;;;1 1 1 1 0

(defun cell (state row col) (
  nth col (nth row state)
  ))

;;;;za dani index retka i stupca broji zive u danom i susjednim redcima
(defun count-live (state row col) (
  if (eq row 0) (+ (count-exact (nth row state) col) (count-neigh (nth (+ row 1) state) col) ) ;;;;prvi redak
    (if (eq row 4) (  + (count-exact (nth row state) col) (count-neigh (nth (- row 1) state) col)   );;;;zadnji redak
      (  + (count-exact (nth row state) col) (count-neigh (nth (+ row 1) state) col)  (count-neigh (nth (- row 1) state) col)  );;;;sredina
      )
  ))

;;;;za dani susjedni redak broji zive onoga koji je na indexu u susjednom redku
(defun count-neigh (row index) (
  if (eq index 0) (+ (nth (+ index 1) row) (nth index row))
    (if (eq index 4) (+ (nth (- index 1) row) (nth index row)) 
      (+ (nth (- index 1) row ) (nth index row)  (nth (+ index 1) row ) ) 
      )
  ))

;;;;za dani redak broji zive susjede onog na indexu
(defun count-exact (row index) (
  if (eq index 0) (nth (+ index 1) row)
    (if (eq index 4) (nth (- index 1) row) 
      (+ (nth (- index 1) row )  (nth (+ index 1) row ) ) 
      )
  ))

(defun evolve (state row) (
  if(> row 3) (cons (evolve-row state row 0) nil)
  (cons (evolve-row state row 0) (evolve state (+ 1 row)))
  ))

(defun next-state (neighs) (;;;;rules
  if (< neighs 2) 0;;;;die
  (if (> neighs 3) 0;;;;die 
    1);;;live
))

(defun evolve-row (state ri ci) (;;;;col je index, row je index
  if (> ci 3) (cons (next-state (count-live state ri ci)) nil);;;;returnaj cell nemoj nastavljati
    (cons (next-state (count-live state ri ci))  (evolve-row state ri (+ ci 1));;;;returnaj i nastavi
      ))
)


