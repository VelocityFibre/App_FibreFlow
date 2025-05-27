-- First, let's check for duplicate projects
SELECT name, province, region, COUNT(*) 
FROM new_projects 
GROUP BY name, province, region 
HAVING COUNT(*) > 1;

-- Now let's remove the duplicates by keeping only one record for each project
WITH duplicates AS (
  SELECT id, name, province, region,
    ROW_NUMBER() OVER (PARTITION BY name, province, region ORDER BY id) as row_num
  FROM new_projects
)
DELETE FROM new_projects
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Verify the duplicates are gone
SELECT name, province, region, COUNT(*) 
FROM new_projects 
GROUP BY name, province, region 
HAVING COUNT(*) > 1;
