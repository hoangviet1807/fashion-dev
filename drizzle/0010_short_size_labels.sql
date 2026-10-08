UPDATE "order_items" SET "size" = CASE "size"
  WHEN 'XX-Small' THEN 'XXS'
  WHEN 'X-Small' THEN 'XS'
  WHEN 'Small' THEN 'S'
  WHEN 'Medium' THEN 'M'
  WHEN 'Large' THEN 'L'
  WHEN 'X-Large' THEN 'XL'
  WHEN 'XX-Large' THEN '2XL'
  WHEN '3X-Large' THEN '3XL'
  WHEN '4X-Large' THEN '4XL'
END
WHERE "size" IN ('XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large');
